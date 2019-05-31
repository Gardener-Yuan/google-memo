class StoreDB {
  constructor(params) {
    this.db = null;
    this.dbStore = null;
    this.TABLE_NAME = 'todoList';
  }

  createIndexDB() {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open('googleMemoDB', 1);

      request.onsuccess = (e) => {
        this.db = request.result;
        console.log('数据库打开成功');
        resolve(true);
      };

      request.onerror = (e) => {
        console.log('数据库打开报错');
        reject(false);
      };

      request.onupgradeneeded = (e) => {
        this.db = e.target.result;

        if (!this.db.objectStoreNames.contains(this.TABLE_NAME)) {
          this.dbStore = this.db.createObjectStore(this.TABLE_NAME, {autoIncrement: true});
          resolve(true);
        }
      }
    })
  }

  selectData() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject([]);
      }

      let objectStore = this.db.transaction([this.TABLE_NAME]).objectStore(this.TABLE_NAME);
      let arrs = [];

      objectStore.openCursor().onsuccess = (e) => {
        let cursor = e.target.result;

        if (cursor) {
          console.log(cursor);
          arrs.push({
            key: cursor.key,
            todo: cursor.value.todo,
            time: cursor.value.time,
            isDone: cursor.value.isDone
          });
          cursor.continue();
        } else {
          console.log('没有更多数据了！');
          resolve(arrs)
        }
      }
    })
  }

  insertData(datas) {
    return new Promise((resolve, reject) => {
      let request = this.db.transaction([this.TABLE_NAME], 'readwrite')
        .objectStore(this.TABLE_NAME)
        .add(datas);

      request.onsuccess = (e) => {
        resolve(true);
        console.log('写入数据库成功')
      };

      request.onerror = (e) => {
        reject(false);
        console.log('数据写入失败');
      }
    });
  }

  updatedData(object) {
    let request = this.db.transaction([this.TABLE_NAME], 'readwrite')
      .objectStore(this.TABLE_NAME);

    request.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;

      if (cursor) {
        console.log(cursor);
        let value = cursor.value;
        let updateRequest = null;

        if (cursor.key === object.key) {
          value.todo = object.todo;
          value.time = object.time;
          value.isDone = object.isDone;

          updateRequest = cursor.update(value);
          updateRequest.onerror = function(){
            console.log('游标更新失败');
          };
          updateRequest.onsuccess = function(){
            console.log('游标更新成功');
          }
        } else {
          cursor.continue();
        }
      } else {
        console.log('没有更多数据了！');
      }
    };

    request.onsuccess = (e) => {
      console.log('数据更新成功');
    };

    request.onerror = (e) => {
      console.log('数据更新失败');
    }
  }

  deleteData(id) {
    let request = this.db.transaction([this.TABLE_NAME], 'readwrite')
      .objectStore(this.TABLE_NAME)
      .delete(id);

    request.onsuccess = (e) => {
      console.log('数据删除成功');
    };
  }
}

window.StoreDB = new StoreDB();
