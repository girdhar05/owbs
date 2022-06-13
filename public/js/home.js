console.log('hello world')
console.log(document.cookie)
let workerData = document.getElementById('workerData').dataset.workerdata
let maindata = JSON.parse(workerData);
console.log(maindata)
async function bookWorker(workerId) {
  if(!getCookie('userId')) return alert('please login to book worker')

  let data = await fetch('/bookworker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workerId: workerId,
      userId: getCookie('userId'),
      createdDate: new Date
    })
  }).then(res => res.json())
  if(data) alert('worker booked successfully')
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}