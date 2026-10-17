import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/utils/popupFrequency.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText
function setup(storage = new Map(), blocked = false, quotaExceeded = false) {
  let today = '2026-10-16'
  const context = {
    exports: {},
    require: () => ({ getTodayKey: () => today }),
    localStorage: {
      getItem: key => {
        if (blocked) throw Error('blocked')
        return storage.get(key) ?? null
      },
      setItem: (key, value) => {
        if (blocked || quotaExceeded) throw Error('blocked')
        storage.set(key, value)
      },
      removeItem: key => storage.delete(key)
    }
  }
  vm.runInNewContext(code, context)
  return {
    ...context.exports,
    nextDay: () => {
      today = '2026-10-17'
    }
  }
}
const options = {
  key: 'notice:1',
  mode: 'daily',
  memberId: 'A',
  loginSessionId: 'login1',
  homeVisitId: 'visit1'
}

test('backend mappings and unknown values', () => {
  const api = setup()
  assert.equal(api.resolvePopupMode(1, 'guest'), 'once')
  assert.equal(api.resolvePopupMode(2, 'guest'), 'frequent')
  assert.equal(api.resolvePopupMode(1, 'authenticated'), 'daily')
  assert.equal(api.resolvePopupMode('2', 'authenticated'), 'each-login')
  assert.equal(api.resolvePopupMode(3, 'authenticated'), 'none')
  assert.equal(api.resolvePopupMode(4, 'authenticated'), 'frequent')
  assert.equal(api.resolvePopupMode(99, 'authenticated'), 'none')
  assert.equal(api.resolvePopupMode(true, 'authenticated'), 'none')
})
test('daily is read-only until shown, isolated by key and account, resets next day', () => {
  const api = setup()
  assert.equal(api.shouldShowPopup(options), true)
  assert.equal(api.shouldShowPopup(options), true)
  api.markPopupShown(options)
  assert.equal(api.shouldShowPopup(options), false)
  assert.equal(api.shouldShowPopup({ ...options, memberId: 'B' }), true)
  assert.equal(api.shouldShowPopup({ ...options, memberId: '' }), true)
  assert.equal(api.shouldShowPopup({ ...options, key: 'ticket:1' }), true)
  api.nextDay()
  assert.equal(api.shouldShowPopup(options), true)
})
test('login survives reload but a new session can show; frequent requires a new visit', () => {
  const storage = new Map()
  const api = setup(storage)
  const login = { ...options, mode: 'each-login' }
  api.markPopupShown(login)
  assert.equal(setup(storage).shouldShowPopup(login), false)
  assert.equal(api.shouldShowPopup({ ...login, loginSessionId: 'login2' }), true)
  assert.equal(api.shouldShowPopup({ ...login, loginSessionId: '' }), false)
  const frequent = { ...options, mode: 'frequent' }
  api.markPopupShown(frequent)
  assert.equal(api.shouldShowPopup(frequent), false)
  assert.equal(api.shouldShowPopup({ ...frequent, homeVisitId: 'visit2' }), true)
})
test('once, none, invalid key and blocked storage', () => {
  const api = setup(new Map(), true)
  const once = { ...options, mode: 'once' }
  api.markPopupShown(once)
  assert.equal(api.shouldShowPopup(once), false)
  api.markPopupShown(options)
  assert.equal(api.shouldShowPopup(options), false)
  assert.equal(api.shouldShowPopup({ ...options, mode: 'none' }), false)
  assert.equal(api.shouldShowPopup({ ...options, key: '' }), false)
})

test('quota failures override stale stored values and tabs do not overwrite frequent visits', () => {
  const storage = new Map()
  const initial = setup(storage)
  initial.markPopupShown(options)
  const blockedWrite = setup(storage, false, true)
  blockedWrite.nextDay()
  assert.equal(blockedWrite.shouldShowPopup(options), true)
  blockedWrite.markPopupShown(options)
  assert.equal(blockedWrite.shouldShowPopup(options), false)
  const frequent = { ...options, mode: 'frequent' }
  initial.markPopupShown(frequent)
  setup(storage).markPopupShown({ ...frequent, homeVisitId: 'another-tab' })
  assert.equal(initial.shouldShowPopup(frequent), false)
})

function loadModule(path, imports, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replaceAll(
    'import.meta.hot',
    'undefined'
  )
  const context = {
    exports: {},
    require: name => {
      if (!(name in imports)) throw Error(`Unexpected import: ${name}`)
      return imports[name]
    },
    ...globals
  }
  vm.runInNewContext(
    ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    context
  )
  return context.exports
}

test('session IDs persist over reload, rotate on login/logout without clearing daily records', () => {
  const api = setup()
  let sequence = 0
  const load = () =>
    loadModule(
      '../src/utils/popupSession.ts',
      { './popupFrequency': api },
      { crypto: { randomUUID: () => `id-${++sequence}` } }
    )
  const session = load()
  const id = session.startPopupLoginSession('A')
  assert.equal(load().getPopupLoginSession('A'), id)
  api.markPopupShown(options)
  session.clearPopupLoginSession()
  assert.notEqual(session.startPopupLoginSession('A'), id)
  assert.equal(api.shouldShowPopup(options), false)
  assert.notEqual(session.getPopupLoginSession('B'), id)
})

test('home visits change on re-entry and bfcache, not language redirects or failed navigation', () => {
  let afterEach,
    pageShow,
    sequence = 0
  const api = loadModule(
    '../src/utils/homePopVisit.ts',
    {
      vue: { reactive: value => value },
      './popupSession': { createPopupId: () => `visit-${++sequence}` }
    },
    {
      window: {
        addEventListener: (_, callback) => {
          pageShow = callback
        }
      }
    }
  )
  api.initHomePopupVisits({
    afterEach: callback => {
      afterEach = callback
    }
  })
  const visit = api.homePopVisitState
  afterEach({ name: 'Home' }, {}, null)
  const first = visit.id
  afterEach({ name: 'LocaleHome' }, {}, null)
  assert.equal(visit.id, first)
  afterEach({ name: 'Other' }, {}, Error('cancelled'))
  assert.equal(visit.isHome, true)
  afterEach({ name: 'Other' }, {}, null)
  afterEach({ name: 'Home' }, {}, null)
  assert.notEqual(visit.id, first)
  const second = visit.id
  pageShow({ persisted: true })
  assert.notEqual(visit.id, second)
})

test('ticket request failures and stale responses do not open or consume popup frequency', async () => {
  let resolveRequest,
    rejectRequest,
    valid = true,
    opened = 0,
    marked = 0
  const state = { visible: false }
  const api = loadModule(
    '../src/utils/autoOpenTicketActivity.ts',
    {
      '@/stores/user': {
        useUserStore: () => ({ syncStoredUserData() {}, userInfo: { tradeToken: 'test' } })
      },
      './popupContext': { getPopupContext: () => options, isPopupContextCurrent: () => valid },
      '@/views/activity/ticket/shared/userTicketInventory': { setUserTicketInventoryRecords() {} },
      '@/views/activity/ticket/shared/mappers/mbTicketMapper': {
        fetchMbTicketListRecords: () =>
          new Promise((resolve, reject) => {
            resolveRequest = resolve
            rejectRequest = reject
          })
      },
      './locale': { getLanguageCode: () => 'zh' },
      '@/views/activity/ticket/shared/ticketAutoPop': {
        resolveTicketAutoPop: () => ({
          sortedRecords: [],
          topRecord: {},
          gameId: 'golden_egg',
          shouldAutoPop: true
        }),
        markAutoPopShown: () => {
          assert.equal(state.visible, true)
          marked++
        }
      },
      '@/views/activity/ticket/shell/ticketToast': {
        globalTicketToastState: state,
        setTicketSession() {},
        openTicketToast: () => {
          state.visible = true
          opened++
        }
      }
    },
    { console: { error() {} } }
  )
  let pending = api.maybeAutoOpenTicketActivity()
  rejectRequest(Error('network'))
  await pending
  assert.equal(marked, 0)
  pending = api.maybeAutoOpenTicketActivity()
  valid = false
  resolveRequest([])
  await pending
  assert.equal(opened, 0)
  valid = true
  pending = api.maybeAutoOpenTicketActivity()
  resolveRequest([{}])
  await pending
  assert.equal(marked, 1)
  assert.equal(opened, 1)
})
