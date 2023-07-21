#!/usr/bin/env python
# coding=utf-8
import asyncio
import logging
import json
import time

from memoflow.conf import CONF
from memoflow.core import wsgi
from memoflow.core import dependency

LOG = logging.getLogger(__name__)

SYNC_DATA_BASE_PATH = CONF.diary_log['SYNC_DATA_BASE_PATH']
SYNC_TABLE_NAME = CONF.diary_log['SYNC_TABLE_NAME']
REVIEW_TABLE_NAME = CONF.diary_log['REVIEW_TABLE_NAME']

#clipboard
CLIPBOARD_TABLE_NAME = CONF.diary_log['CLIPBOARD_TABLE_NAME'] #clipboard数据表名
CLIPBOARD_DATA_BASE_PATH = CONF.diary_log['DATA_BASE_CLIPBOARD_PATH'] #clipboard数据库路径

@dependency.requires('diary_log_api')
class DiaryLog(wsgi.Application):
    def add_log(self, req):
        # 从请求中获取POST数据
        data = req.body
        
        # 将POST数据转换为JSON格式
        diary_log = json.loads(data)
        LOG.info("diary_log json_data:, %s" % diary_log["content"][:70])

        # get tags
        tags = self.diary_log_api.get_tags_from_content(diary_log['content'])
        # 处理卡片笔记
        processed_content = self.diary_log_api.process_content(diary_log['content'])
        processed_block_content = self.diary_log_api.process_block(processed_content)

        # 保存到本地数据库
        self.diary_log_api.save_log(processed_content, tags)

        # # 发送到浮墨笔记
        # flomo_post_data = {"content": processed_content}
        # self.diary_log_api.send_log_flomo(flomo_post_data)

        # # 向notion 发送数据
        # self.diary_log_api.celery_send_log_notion(diary_log=processed_content)
        # # asyncio.run(self.diary_log_api.run_tasks(diary_log))

        # 向github仓库（logseq 笔记软件）发送数据
        if CONF.diary_log['SEND_TO_GITHUB'] == True:
            file_path = CONF.diary_log['GITHUB_CURRENT_SYNC_FILE_PATH']
            commit_message = "commit by memoflow"
            branch_name = "main"
            token = CONF.diary_log['GITHUB_TOKEN']
            repo = CONF.diary_log['GITHUB_REPO']
            added_content = processed_block_content
            self.diary_log_api.celery_update_file_to_github(token,
                                                            repo,
                                                            file_path,
                                                            added_content,
                                                            commit_message,
                                                            branch_name)

        # 向坚果云发送异步任务，更新文件
        # 坚果云账号
        if CONF.diary_log['SEND_TO_JIANGUOYUN'] == True:
            JIANGUOYUN_COUNT = CONF.api_conf.JIANGUOYUN_COUNT
            JIANGUOYUN_TOKEN = CONF.api_conf.JIANGUOYUN_TOKEN
            base_url = CONF.api_conf.base_url
            to_path = CONF.api_conf.JIANGUOYUN_TO_PATH
            added_content = processed_block_content
            self.diary_log_api.celery_update_file_to_jianguoyun(base_url,
                                                                JIANGUOYUN_COUNT,
                                                                JIANGUOYUN_TOKEN,
                                                                to_path,
                                                                added_content,
                                                                overwrite = True)

        return json.dumps({"content": processed_content})
        # return Response(json_data)
    
    def get_logs(self, req):
        return self.diary_log_api.get_logs()

    def delete_all_log(self, req):
        return self.diary_log_api.delete_all_log()

    def delete_all_log(self, req):
        return self.diary_log_api.delete_all_log()
    
    def test_flomo(self, req):
        self.diary_log_api.test_post_flomo()
        return "sucess"

    # review
    def get_review_logs(self, req):
        return self.diary_log_api.get_review_logs(table=REVIEW_TABLE_NAME,
                                                  columns=['content'],
                                                  data_base_path=SYNC_DATA_BASE_PATH)

    def delete_all_review_log(self, req):
        return self.diary_log_api.delete_all_review_log(data_base_path=SYNC_DATA_BASE_PATH,
                                                        table=REVIEW_TABLE_NAME)

    # clipboard
    def get_clipboard_logs(self, req):
        return self.diary_log_api.get_clipboard_logs(
            table_name=CLIPBOARD_TABLE_NAME,
            columns=['content'],
            data_base_path=CLIPBOARD_DATA_BASE_PATH)
    
    def clipboard_addlog(self, req):
        # 从请求中获取POST数据
        data = req.body
        # 将POST数据转换为JSON格式
        diary_log = json.loads(data)
        LOG.info("diary_log json_data:, %s" % diary_log["content"][:70])
        # 保存到本地数据库
        self.diary_log_api.save_log_to_clipboard_table(
            table_name=CLIPBOARD_TABLE_NAME,
            columns=['content'],
            data = [diary_log["content"]],
            data_base_path=CLIPBOARD_DATA_BASE_PATH
            )
        return json.dumps(diary_log) # data 是否可行？
    
    def get_contents_from_github(self, req):
        # data = req.body
        # 将POST数据转换为JSON格式
        # file_list = json.loads(data)
        # LOG.info("get_contents_file_list json_data:, %s" % file_list)

        # get_contents_from_github
        sync_file_path_list = CONF.diary_log['GITHUB_SYNC_FILE_LIST']
        sync_file_path_list = sync_file_path_list.split(",")
        token = CONF.diary_log['GITHUB_TOKEN']
        repo = CONF.diary_log['GITHUB_REPO']
        branch_name = "main"
        contents = self.diary_log_api.get_contents_from_github( token,
                                                                repo,
                                                                sync_file_path_list,
                                                                branch_name)
        return json.dumps({"contents": contents})

    def sync_contents_from_github_to_db(self, req):
        sync_file_path_list = CONF.diary_log['GITHUB_SYNC_FILE_LIST']
        sync_file_path_list = sync_file_path_list.split(",")
        # remove empty string, and strip space
        for idx, file_path in enumerate(sync_file_path_list):
            file_path = file_path.strip()
            if file_path == "":
                sync_file_path_list.remove(file_path)
            else:
                sync_file_path_list[idx] = file_path

        token = CONF.diary_log['GITHUB_TOKEN']
        repo = CONF.diary_log['GITHUB_REPO']
        branch_name = "main"
        contents = self.diary_log_api.get_contents_from_github( token,
                                                                repo,
                                                                sync_file_path_list,
                                                                branch_name)
        # sync contents to db
        self.diary_log_api.sync_contents_to_db(contents,
                                               table_name=SYNC_TABLE_NAME, data_base_path=SYNC_DATA_BASE_PATH)
        return "success"
