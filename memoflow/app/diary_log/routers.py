#!/usr/bin/env python
# coding=utf-8
from memoflow.core import wsgi
from memoflow.app.diary_log import controllers

class Router(wsgi.ComposableRouter):
    def add_routes(self, mapper):
        diary_log_controller = controllers.DiaryLog()
        mapper.connect('/diary-log/login',
                       controller=diary_log_controller,
                       action='login',
                       conditions=dict(method=['POST']))
        mapper.connect('/diary-log/getlogs',
                       controller=diary_log_controller,
                       action='get_logs',
                       conditions=dict(method=['GET']))
        mapper.connect('/diary-log/addlog',
                       controller=diary_log_controller,
                       action='add_log',
                       conditions=dict(method=['POST']))
        mapper.connect('/diary-log/updatelog',
                       controller=diary_log_controller,
                       action='update_log',
                       conditions=dict(method=['POST']))
        mapper.connect('/diary-log/deletelog/{record_id}',
                       controller=diary_log_controller,
                       action='delete_log',
                       conditions=dict(method=['DELETE']))
        mapper.connect('/diary-log/delete_all_log',
                       controller=diary_log_controller,
                       action='delete_all_log',
                       conditions=dict(method=['GET']))        
        mapper.connect('/diary-log/test_flomo',
                       controller=diary_log_controller,
                       action='test_flomo',
                       conditions=dict(method=['GET']))                           
        # review
        mapper.connect('/diary-log/get_review_logs',
                       controller=diary_log_controller,
                       action='get_review_logs',
                       conditions=dict(method=['GET']))
        mapper.connect('/diary-log/delete_all_review_log',
                       controller=diary_log_controller,
                       action='delete_all_review_log',
                       conditions=dict(method=['GET']))
        
        # 粘贴板
        mapper.connect('/diary-log/get_clipboard_logs',
                       controller=diary_log_controller,
                       action='get_clipboard_logs',
                       conditions=dict(method=['GET']))
        mapper.connect('/diary-log/clipboard_addlog',
                       controller=diary_log_controller,
                       action='clipboard_addlog',
                       conditions=dict(method=['POST']))
        
        # get contents from github
        mapper.connect('/diary-log/get_contents_from_github',
                       controller=diary_log_controller,
                       action='get_contents_from_github',
                       conditions=dict(method=['GET']))
        # sync contents from github to db
        mapper.connect('/diary-log/sync-contents-from-github-to-db',
                       controller=diary_log_controller,
                       action='sync_contents_from_github_to_db',
                       conditions=dict(method=['GET']))
        
        # search contents from vecter db
        mapper.connect('/diary-log/search-contents-from-vecter-db',
                        controller=diary_log_controller,
                        action='search_contents_from_vecter_db',
                        conditions=dict(method=['POST']))
        
        # get logs and send all que string to vector db
        mapper.connect('/diary-log/update_all_que_to_vector_db',
                        controller=diary_log_controller,
                        action='update_all_que_to_vector_db',
                        conditions=dict(method=['PUT']))

        # peek vector db
        mapper.connect('/diary-log/peek-vector-db/{limit}',
                       controller=diary_log_controller,
                       action='peek_vector_db',
                       conditions=dict(method=['GET']))      
        
        mapper.connect('/diary-log/get-collection-items/{limit}',
                       controller=diary_log_controller,
                       action='get_collection_items',
                       conditions=dict(method=['GET']))
        
        mapper.connect('/diary-log/get-vector-db-coll-all-ids',
                       controller=diary_log_controller,
                       action='get_vector_db_coll_all_ids',
                       conditions=dict(method=['GET']))
        # delete collection items 
        mapper.connect('/diary-log/delete-collection-items',
                       controller=diary_log_controller,
                       action='delete_collection_item',
                       conditions=dict(method=['POST']))

        # delete all collection items 
        mapper.connect('/diary-log/delete-all-collection-items',
                       controller=diary_log_controller,
                       action='delete_all_collection_item',
                       conditions=dict(method=['DELETE']))
                       