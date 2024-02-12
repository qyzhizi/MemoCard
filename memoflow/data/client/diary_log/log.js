function addLogEntry(logText, record_id) {
    var pre = $('<pre class="log-entry"></pre>'); // 添加一个类以便样式控制
    // 将 pre 元素的内容添加到 pre 中
    pre.text(logText);
    // 创建一个包含下拉菜单的容器
    var logEntryContainer = $('<div class="log-entry-container"></div>');
    // 下拉菜单图标容器
    var dropdownContainer = $('<div class="dropdown-container"></div>');
    // 下拉菜单图标
    var dropdownIcon = $(
        '<span class="btn more-action-btn">' +
        '   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-vertical icon-img">' +
        '       <circle cx="12" cy="12" r="1"></circle>' +
        '       <circle cx="12" cy="5" r="1"></circle>' +
        '       <circle cx="12" cy="19" r="1"></circle>' +
        '   </svg>' +
        '</span>'
    );
    // 下拉菜单
    var dropdownMenu = $('<div class="dropdown-menu"></div>');

    // 将 record_id 添加到 dropdownMenu 作为属性
    dropdownMenu.data('record_id', record_id);
    // dropdownMenu.attr('record_id', record_id);

    // 添加复制选项
    var copyOption = $('<div class="dropdown-option copy-option">复制</div>');
    // 添加编辑选项
    var editOption = $('<div class="dropdown-option edit-option">编辑</div>');
    // 添加删除选项
    var deleteOption = $('<div class="dropdown-option delete-option">删除</div>');

    // 将下拉菜单图标添加到 dropdownContainer 中
    dropdownContainer.append(dropdownIcon);
    // 将下拉菜单添加到 dropdownContainer 中
    dropdownContainer.append(dropdownMenu);
    // 将 dropdownContainer 添加到 logEntryContainer 中
    logEntryContainer.append(dropdownContainer);
    // 将 pre 添加到 logEntryContainer 中
    logEntryContainer.append(pre);
    // 将 logEntryContainer 添加到 logList 中
    var logList= $('#logList');
    logList.prepend(logEntryContainer);

    // 点击下拉菜单图标时触发事件
    dropdownIcon.click(function(event) {
        // 阻止事件冒泡
        event.stopPropagation();
        // 显示或隐藏下拉菜单
        dropdownMenu.toggle();
    });

    // 在文档的其他位置点击时隐藏下拉菜单
    $(document).click(function() {
        dropdownMenu.hide();
    });

    // 添加复制选项点击事件处理程序
    copyOption.click(function() {
        // 复制日志文本到剪贴板
        copyToClipboard(logText);
        // 隐藏下拉菜单
        dropdownMenu.hide();
    });

    // 添加编辑选项点击事件处理程序
    editOption.click(function() {
        record_id = dropdownMenu.data('record_id')
        console.log("record_id : ", record_id)
        // 编辑日志条目
        editLogEntry(pre, record_id);
        // 隐藏下拉菜单
        dropdownMenu.hide();
    });

    // 添加删除选项点击事件处理程序
    deleteOption.click(function() {
        record_id = dropdownMenu.data('record_id')
        console.log("record_id : ", record_id)
        deleteLogEntry(record_id)
        // 删除日志条目
        logEntryContainer.remove();
        // 隐藏下拉菜单
        dropdownMenu.hide();
    });

    // 将复制、编辑和删除选项添加到下拉菜单中
    dropdownMenu.append(copyOption);
    dropdownMenu.append(editOption);
    dropdownMenu.append(deleteOption);
}

// 复制到剪贴板函数
function copyToClipboard(text) {
    // 创建一个新的 ClipboardItem 对象
    const clipboardItem = new ClipboardItem({ "text/plain": new Blob([text], { type: "text/plain" }) });
  
    // 将文本添加到剪贴板
    navigator.clipboard.write([clipboardItem]).then(function() {
      console.log('文本已成功复制到剪贴板');
    }).catch(function(err) {
      console.error('复制失败:', err);
    });
  }
  
function editLogEntry(pre, record_id) {
    // 获取编辑框元素
    var modal = document.getElementById('editLogModal');

    // 获取编辑框中的文本域
    var editedLog = document.getElementById('editedLog');

    // 显示模态框
    modal.style.display = "block";

    // 将原始日志内容填充到编辑框中
    editedLog.value = pre.text();

    // 获取保存按钮
    var saveChangesBtn = document.getElementById('saveChangesBtn');

    // 当用户点击保存按钮时
    saveChangesBtn.onclick = function() {
        // 获取编辑后的日志内容
        var editedText = editedLog.value;

        // 这里可以发送请求到后端，保存编辑后的日志内容
        if (editedText === '') {
            console.log("log is none")
            return; // 退出函数
        }

        $.ajax({
            url: '/v1/diary-log/updatelog',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            },
            contentType: 'application/json',
            data: JSON.stringify({content: editedText, record_id: record_id}),
            success: function(response) {
                console.log("edited success")
            },
            error: function(error) {
                console.log(error);
            }
        });
        // 然后根据后端返回的结果进行相应的处理，比如更新界面等

        // 更新原始的日志内容
        pre.text(editedText);

        // 关闭模态框
        modal.style.display = "none";

        // 在控制台输出提示信息
        console.log('日志已成功编辑并保存');
    }

    // 获取关闭按钮，并为其添加点击事件处理程序
    var closeBtn = document.getElementsByClassName("close")[0];
    closeBtn.onclick = function() {
        // 关闭模态框
        modal.style.display = "none";
    }

    // 当用户点击模态框外部区域时，关闭模态框
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// 删除日志条目函数
function deleteLogEntry(record_id) {
    // 删除日志条目的具体逻辑
    $.ajax({
        url: '/v1/diary-log/deletelog/' + record_id,
        type: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        },
        success: function(response) {
            // 请求成功时的处理
            console.log('Logs deleted successfully.');
            // 可以在这里执行其他操作，如刷新页面或更新UI等
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
    
            if (jqXHR.status === 401) {
                // HTTPUnauthorized error
                console.log("Unauthorized - Redirecting to login page");
                window.location.href = '/v1/diary-log/login.html';
            } else {
                // Handle other error types as needed
                console.log("Other error:", textStatus, errorThrown);
            }
        }
    });
}


// 使用示例：
// 假设有一个 id 为 logList 的容器，你可以调用 addLogEntry 函数来添加日志条目。
// 例如：
// addLogEntry('这是一条日志信息');


$(function() {
    $('#submit').on('click', function(event) {
        event.preventDefault();
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        var log = `## ${dateStr} ${timeStr}:\n`+ $('#log').val();
        if ($('#log').val() === '') {
            console.log("log is none")
            return; // 退出函数
        }

        $.ajax({
            url: '/v1/diary-log/addlog',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({content: log}),
            success: function(response) {
                response = JSON.parse(response)
                addLogEntry(response.content, response.record_id)
                
                // 清空 输入框
                $('#log').val('');
                // console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    $('#pull').on('click', function(event) {
        event.preventDefault();
        // ask for confirmation
        if (!confirm("Are you sure to pull files from github?")) {
            return;
        }
        $.ajax({
            url: '/v1/diary-log/sync-contents-from-github-to-db',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            },
            success: function(response) {
                console.log(response);
                // pop up a dialog
                alert(response);
                // reload the page
                window.location.reload();
            },
            error: function(error) {
                // pop up a dialog
                alert(error);
                console.log(error);
            }
        });
    });
    $.ajax({
        url: '/v1/diary-log/getlogs',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        },
        success: function(response) {
            // console.log(response);
            response = JSON.parse(response)
            for (var i = 0; i < response.logs.length; i++) {
                addLogEntry(response.logs[i], response.ids[i]);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
    
            if (jqXHR.status === 401) {
                // HTTPUnauthorized error
                console.log("Unauthorized - Redirecting to login page");
                window.location.href = '/v1/diary-log/login.html';
            } else {
                // Handle other error types as needed
                console.log("Other error:", textStatus, errorThrown);
            }
        }
    });

    $('#delete_all').on('click', function(event) {
        event.preventDefault();
        // var log = $('#log').val();
        $.ajax({
            url: '/v1/diary-log/delete_all_log',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            },
            success: function(response) {
                var logList= $('#logList');
                logList.html("");
                // console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    
    var txtInput = document.getElementById('log');
    txtInput.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === "q") {
          console.log("alt+q was pressed.");
          // 在这里编写按下alt+q 后要执行的代码
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var value = this.value;
            var selectedText = value.substring(start, end);
            var indentedText = selectedText.split('\n').map(function(line) {
                const leading_t = '\t'
                return leading_t + line; // 将生成的空格字符串和剩余的字符串拼接返回
            }).join('\n');
            this.value = value.substring(0, start) + indentedText + value.substring(end);
            if (selectedText.length){
                this.selectionStart = start;
                this.selectionEnd = end + (indentedText.length - selectedText.length);
            } else {
                this.selectionEnd = end + (indentedText.length - selectedText.length);
                this.selectionStart = this.selectionEnd;
            }                
        }
      });

    txtInput.addEventListener('keydown', function(e) {
        if (e.key === "Tab") { // 按下Tab键或Shift+Tab键
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var value = this.value;
            var selectedText = value.substring(start, end);

            if (e.shiftKey) { // 按下Shift键 需要反缩进

                // 获取选中文本所在行的起始位置和结束位置
                var lineStart = value.lastIndexOf('\n', start - 1) + 1;
                var lineEnd = value.indexOf('\n', end);
                // 如果选中文本所在行是最后一行，需要特殊处理
                if (lineEnd === -1) {
                lineEnd = value.length;
                }
                // 获取选中文本所在行的所有字符串
                selectedText = value.substring(lineStart, lineEnd);

                var unindentedText = selectedText.split('\n').map(function(line) {
                    var leadingTabs = line.match(/^\t+/); // 匹配行首的制表符
                    if (leadingTabs) { // 存在制表符
                        // 将制表符替换为四个空格，然后去掉前四个空格或制表符
                        let i = 0;
                        while (line[i] === '\t') {i++;}
                        const leadingSpaces = '    '.repeat(i); // 生成 i 个空格的字符串
                        line = leadingSpaces + line.substring(i); // 将生成的空格字符串和剩余的字符串拼接返回
                        return line.substring(4);
                    } else if (line.match(/^ {1}/)) { // 前面至少有一个空格时
                        const leadingSpaces = line.match(/^\x20/)[0];
                    return line.substring(leadingSpaces.length)
                    } else {
                        return line;
                    }
                }).join('\n');
                this.value = value.substring(0, lineStart) + unindentedText + value.substring(lineEnd);
                var length_d = selectedText.length - unindentedText.length;
                if ((start - length_d) < lineStart){this.selectionStart = lineStart}
                else {this.selectionStart = start - length_d;}
                this.selectionEnd = end - length_d;
            } else { // 没有按下Shift键
                var indentedText = selectedText.split('\n').map(function(line) {
                    let i = 0;
                    while (line[i] === '\t') {i++;}
                    j = i+1 // 使用4个空格进行正向缩进
                    const leadingSpaces = '    '.repeat(j); // 生成 i 个空格的字符串
                    return leadingSpaces + line.substring(i); // 将生成的空格字符串和剩余的字符串拼接返回
                }).join('\n');
                this.value = value.substring(0, start) + indentedText + value.substring(end);
                if (selectedText.length){
                    this.selectionStart = start;
                    this.selectionEnd = end + (indentedText.length - selectedText.length);
                } else {
                    this.selectionEnd = end + (indentedText.length - selectedText.length);
                    this.selectionStart = this.selectionEnd;
                }
            }
            e.preventDefault();
        }
    });   

    // 监听窗口关闭事件
    window.addEventListener("beforeunload", function (event) {
        var inputBox = document.getElementById("log");
        // 检测输入框内容是否为空
        if (inputBox.value.trim().length > 0) {
            // 显示提示框
            event.preventDefault();
            // beforeunload 事件的返回值
            event.returnValue = " ";
        }
    });
});
