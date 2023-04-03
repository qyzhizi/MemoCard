$(function() {
    $('#submit').on('click', function(event) {
        event.preventDefault();
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        var log = `## ${dateStr} ${timeStr}:\n`+ $('#log').val();
        // console.log($('#log').val())
        // console.log(log)
        $.ajax({
            url: '/v1/diary-log-lrx/addlog',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({content: log}),
            success: function(response) {

                var logList= $('#logList');
                response = JSON.parse(response)
                var pre = $('<pre></pre>');
                pre.text(response.content);
                logList.prepend(pre);
                
                $('#log').val('');
                // console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    $.ajax({
        url: '/v1/diary-log-lrx/getlogs',
        type: 'GET',
        success: function(response) {
            // console.log(response);
            response = JSON.parse(response)
            for (var i = 0; i < response.logs.length; i++) {
                var log = response.logs[i];
                var pre = $('<pre></pre>');
                pre.text(log);
                $('#logList').prepend(pre);
            }
        },
        error: function(error) {
            console.log(error);
        }
    });

    $('#delete_all').on('click', function(event) {
        event.preventDefault();
        // var log = $('#log').val();
        $.ajax({
            url: '/v1/diary-log-lrx/delete_all_log',
            type: 'GET',
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
    txtInput.addEventListener('keydown', function(e) {
        if (e.keyCode === 9) { // 按下Tab键或Shift+Tab键
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var value = this.value;
            var selectedText = value.substring(start, end);
            if (e.shiftKey) { // 按下Shift键 需要反缩进
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
                        const leadingSpaces = line.match(/^ {0,4}/)[0];
                    return line.substring(leadingSpaces.length)
                    } else {
                        return line;
                    }
                }).join('\n');
                this.value = value.substring(0, start) + unindentedText + value.substring(end);
                this.selectionStart = start;
                this.selectionEnd = end - (selectedText.length - unindentedText.length);
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
});
