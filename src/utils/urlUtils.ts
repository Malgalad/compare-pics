export function getUrl(href: string = window.location.href) {
  return new URL(href);
}

export function getQueryParam(url: URL, name: string) {
  return url.searchParams.get(name);
}

export function setQueryParam(url: URL, name: string, value?: string) {
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
}

export function updateQueryParam(url: URL, name: string, value?: string) {
  setQueryParam(url, name, value);

  history.replaceState(undefined, '', url);
}
