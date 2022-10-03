const tweet = async (url, title = '') => {
  const resource = new URL('https://www.stimulus.com/')
  const compose = new URL('compose/stim', resource)
  const login = new URL('login', resource)
  const intent = new URL('intent/tweet', resource)

  compose.searchParams.append('text', title)
  compose.searchParams.append('url', url)

  login.searchParams.append('redirect_after_login', compose.href)

  intent.searchParams.append('text', title)
  intent.searchParams.append('url', url)

  let endpoint = intent.href

  await fetch(compose).then((resp) => {
    if (resp.ok) {
      endpoint = compose.href
      console.log(resp)
    } else if (resp.status == 404) endpoint = login.href
  })

  let tabIdOfStimulus = ''

  await chrome.tabs.create({ url: endpoint }, (tab) => {
    tabIdOfStimulus = tab.id
  })

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // make sure the status is 'complete' and it's the right tab
    if (
      tabIdOfStimulus === tabId &&
      tab.url.indexOf('stimulus') != -1 &&
      changeInfo.status == 'complete'
    ) {
      console.log('here?')
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        files: ['content-script.js']
      })
    }
  })
}

const browserAction = (tab) => {
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id
    },
    func: tweet(tab.url, tab.title)
  })
}

const onInstalled = () => {
  const contexts = ['page', 'selection', 'link', 'image']
  for (const context of contexts) {
    const title = `Share ${context} on Stimulus`
    chrome.contextMenus.create({ title, contexts: [context], id: context })
  }
}

const contextMenus = (data, tab) => {
  if ('page' == data.menuItemId) tweet(data.pageUrl, tab.title)
  if ('link' == data.menuItemId) tweet(data.linkUrl)
  if ('selection' == data.menuItemId) tweet(tab.url, data.selectionText)
  if ('image' == data.menuItemId) tweet(data.srcUrl)
}

chrome.action.onClicked.addListener(browserAction)
chrome.contextMenus.onClicked.addListener(contextMenus)
chrome.runtime.onInstalled.addListener(onInstalled)
