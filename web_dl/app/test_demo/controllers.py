#!/usr/bin/env python
# coding=utf-8
import os
import openai
import logging

from webob.response import Response

from web_dl.common import wsgi
from web_dl.common import dependency

LOG = logging.getLogger(__name__)

@dependency.requires('test_api')
class Test(wsgi.Application):
    def test(self, req, name):
        test = self.test_api.test
        return Response("hello world %s, %s" % (name, test))

    def test2(self, req, name):
        test = self.test_api.test
        return Response("hello world2 %s, %s" % (name, test))

    def test_lzw(self, req, name):
        test = self.test_api.test
        #return Response("hello world lzw  %s, %s" % (name, test))
        return "hello world lzw, %s" % name

    def test_chatgpt(self, req, question):
        openai.api_key = "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"
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=question+"\n",
            temperature=0.7,
            max_tokens=4000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
            )

        LOG.info(response["choices"][0]["text"])

        return response["choices"][0]["text"]

    def test_hello(self, req):
        LOG.info("hello lzw")
        return "hello lzw"

    def test_kkk(self, req, kkk):
        LOG.info("hello kkk, %s" % kkk)
        #return "hello lzw"
        return "hello kkk, %s" % kkk
    
    def get_html(self, req):
        return self.test_api.get_html()

