import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import DiscussionTopic, Message
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from django.core.cache import cache

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send cached messages
        cached_messages = await sync_to_async(cache.get)(f'chat_messages_{self.room_name}')
        if cached_messages:
            await self.send(text_data=json.dumps({
                'type': 'cached_messages',
                'messages': cached_messages
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']

        # Save message to database and cache
        await self.save_message(username, self.room_name, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username
            }
        )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']

        await self.send(text_data=json.dumps({
            'message': message,
            'username': username
        }))

    @database_sync_to_async
    def save_message(self, username, room_name, message):
        user = User.objects.get(username=username)
        topic = DiscussionTopic.objects.get(id=room_name)
        new_message = Message.objects.create(user=user, topic=topic, content=message)
        
        # Update cache
        cached_messages = cache.get(f'chat_messages_{room_name}', [])
        cached_messages.append({
            'id': new_message.id,
            'content': new_message.content,
            'created_at': new_message.created_at.isoformat(),
            'user': {
                'id': user.id,
                'username': user.username
            }
        })
        cache.set(f'chat_messages_{room_name}', cached_messages[-50:])  # Keep last 50 messages