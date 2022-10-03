const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop)
})
let text = params.text
let link = params.url
let totalText = `${text} ${link}`
const textInDiv = document.createTextNode(totalText)

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      console.log('returning from here')
      document.querySelector(selector).innerHTML = totalText
      document.querySelector(selector).value = totalText
      document.querySelector(selector).removeAttribute('placeholder')
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        document.querySelector(selector).innerHTML = totalText
        document.querySelector(selector).value = totalText
        document.querySelector(selector).removeAttribute('placeholder')
        resolve(document.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

waitForElm("[data-testid='PostInput']").then(() => {
  const modalRoot = document.getElementById('__modal-root')
  let inputTextArea = modalRoot.querySelector("[data-testid='PostInput']")
  let highlighter = modalRoot.querySelector("[data-testid='Highlighter']")

  // callback for mutation observer
  const logMutations = function (mutations) {
    mutations.forEach(function (mutation) {
      console.log(mutation.type)
      if (mutation.type === 'childList') {
        if (!inputTextArea.innerHTML && !inputTextArea.value) {
          inputTextArea.innerHTML = totalText
          inputTextArea.value = totalText
          inputTextArea.removeAttribute('placeholder')
          var evt = new Event('change', { bubbles: true, cancelable: false })
          inputTextArea.dispatchEvent(evt)
        }
      }
    })
  }

  // create an observer instance
  const observer = new MutationObserver(logMutations)

  // start observing target element
  observer.observe(inputTextArea, { childList: true, subtree: true })

  highlighter.appendChild(textInDiv)
  inputTextArea.innerHTML = totalText
  inputTextArea.value = totalText
  inputTextArea.removeAttribute('placeholder')

})



