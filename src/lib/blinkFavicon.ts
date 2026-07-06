export function startBlinkingFavicon() {
  const favicon = document.getElementById('favicon') as HTMLLinkElement | null
  if (!favicon) return

  let isOn = true
  setInterval(() => {
    isOn = !isOn
    const file = isOn ? 'favicon-on.svg' : 'favicon-off.svg'
    favicon.href = `/${file}?t=${Date.now()}`
  }, 530)
}