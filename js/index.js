class Memo {
  constructor() {
    this.todolist = [];
    this.curAdd = {};
    this.$form = document.querySelector('#todo-form');
    this.$todoWrapper = document.querySelector('.todo-list');

    // 链接数据库
    window.StoreDB.createIndexDB().then((res) => {
      this.getTodoList();
      this.init();
    });
  }

  init() {
    this.$form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodoList();
      return false;
    });

    document.addEventListener('click', (e) => {
      if (e.target.className.includes('btn-delete')) {
        e.preventDefault();
        this.removeItem(e.target, +e.target.dataset.key);
      }

      // checkbox点击
      if (e.target.className.includes('checkbox-isdone')) {
        let curData = this.todolist.find(o => o.key === +e.target.parentNode.parentNode.dataset.key);

        curData.isDone = !!e.target.checked;
        window.StoreDB.updatedData(curData);

        if (curData.isDone) {
          e.target.parentNode.parentNode.className = 'delete';
        } else {
          e.target.parentNode.parentNode.className = '';
        }
      }
    })
  }

  getTodoList() {
    window.StoreDB.selectData().then((res) => {
      this.todolist = res;

      this.$todoWrapper.innerHTML = '';

      res.forEach((o) => {
        this.$todoWrapper.innerHTML += Memo.todoTemplate(o)
      });
    })
  }

  addTodoList() {
    const formData = new FormData(this.$form);
    const $timeEl = document.querySelector('input[name=time]');
    const $todoEl = document.querySelector('input[name=todo]');

    // if (!(/^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(formData.get('time')))){
    //   $timeEl.setAttribute('placeholder', 'Please input format time');
    //   $timeEl.className += ' error';
    //   return;
    // } else {
    //   $timeEl.className = '';
    // }

    if (!$todoEl.value || !$timeEl.value) {
      $timeEl.className += ' error';
      return;
    } else {
      $timeEl.className = '';
    }

    this.curAdd = {
      todo: formData.get('todo'),
      time: formData.get('time'),
      isDone: false
    };

    window.StoreDB.insertData(this.curAdd).then((res) => {
      this.getTodoList();
    });
    return false;
  }

  removeItem(el, key) {
    this.$todoWrapper.removeChild(el.parentNode.parentNode);
    window.StoreDB.deleteData(key);
  }

  static todoTemplate(data) {
    const now = new Date().valueOf();
    const dataTime = new Date(data.time).valueOf();
    const outTime = (now > dataTime + 1000 * 60 * 60 * 24);
    const curTime = new Date(data.time);
    const format = `${curTime.getFullYear()}/${(curTime.getMonth() + 1).toString().padStart(2, "0")}/${curTime.getDate().toString().padStart(2, "0")} ${curTime.getHours().toString().padStart(2, "0")}:${curTime.getMinutes().toString().padStart(2, "0")}:${curTime.getSeconds().toString().padStart(2, "0")}`;

    return (
      `<li data-key="${data.key}" class="${outTime || data.isDone ? 'delete' : ''}">
          <p><input class="checkbox-isdone" type="checkbox" name="isDone" ${data.isDone ? 'checked' : ''}></p>
          <p class="flex-1 middle">${data.todo}</p>
          <p class="flex-1 text-right">${format}</p>
          <p class="delete-wrap text-right">
            <button type="button" class="btn btn-delete" data-key="${data.key}">-</button>
          </p>
      </li>`
    )
  }
}

window.memo = new Memo();
