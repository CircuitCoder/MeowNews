export function formatTime(d) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export function formatDate(d) {
  return `${(d.getYear() + 1900).toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export function formatDateTime(d) {
  return `${formatDate(d)} ${formatTime(d)}`;
}

export async function fetchList({ from, till, category, keywords, limit }) {
  const tillTs = till || formatDateTime(new Date());
  const fromTs = from || '1970-01-01 00:00:00';
  let url = `xXxXxXxXxXx?size=${limit || 20}&startDate=${fromTs}&endDate=${tillTs}&categories=${category || ''}&words=${(keywords || []).join(',')}`;

  const resp = await fetch(url);
  const list = await resp.json();

  return postprocessList(list);
}

function postprocessList(list) {
  for(const row of list.data) {
    let images = row.image;

    while(images.length > 0 && images[0] === '[') images = images.substr(1);
    while(images.length > 0 && images[images.length-1] === ']') images = images.substr(0, images.length-1);

    row.images = images.split(',').filter(e => !!e);
  }

  return list;
}
