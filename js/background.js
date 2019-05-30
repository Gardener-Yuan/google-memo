chrome.runtime.onInstalled.addListener(async () => {
  const data = await window.StoreDB.createIndexDB();
  console.log('进入background');

  async function checkData() {
    const list = await window.StoreDB.selectData();

    list.forEach((o) => {
      const now = new Date().valueOf();
      const dataTime = new Date(o.time).valueOf();

      if (!o.isDone && (now >= dataTime && now < dataTime + 1000 * 60 * 60 * 24)) {
        if (!("Notification" in window)) {
          alert(`${o.todo} - ${o.time}`)
        } else if (Notification.permission === "granted") {
          new Notification(`${o.todo}\n ${o.time}`, {
            icon: 'memo_extensions.png'
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              new Notification(`${o.todo}\n ${o.time}`, {
                icon: 'memo_extensions.png'
              });
            }
          });
        }
      }
    })
  }

  checkData();
  // 监听数据存储变化做通知监听
  setInterval(() => {
    checkData();
    console.log('每隔五分钟监听一次');
  }, 1000 * 60 * 5)
});
