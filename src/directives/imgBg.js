export default {
  inserted: bgChange,
  update: bgChange
}

function bgChange(el) {
  var url = el.dataset.url
  if (url) {
    el.style.backgroundImage = `url(${url})`
    el.style.backgroundSize = 'cover'
    el.style.backgroundPosition = 'center'
  }
}
