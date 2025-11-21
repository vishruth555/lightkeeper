import logging
import requests
import certifi


class SlackHandler(logging.Handler):
    def __init__(self, webhook_url: str, level=logging.ERROR):
        super().__init__(level)
        self.webhook_url = webhook_url

    def emit(self, record):
        # log_entry = self.format(record)
        text = f"🚨 Error alert from lightkeeper service \n\n📄 File:{record.filename}\n```⚠️ Error:{record.message}```\n🕒 Timestamp:{record.asctime}"
        payload = {
            "username": "lightkeeper_service",
            "icon_emoji": "tokyo_tower",
            # "text": text
            "blocks": [
                {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🚨 lighthouse Log Alert",
                    "emoji": True
                }
                },
                {
                "type": "section",
                "fields": [
                    {
                    "type": "mrkdwn",
                    "text": f"*Timestamp:*\n{record.asctime}"
                    }
                ]
                },
                {
                "type": "divider"
                },
                {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Message:*\n```{record.message}```"
                }
                },
                {
                "type": "context",
                "elements": [
                    {
                    "type": "mrkdwn",
                    "text": f":page_facing_up: *File:* `{record.filename}`"
                    },
                    {
                    "type": "mrkdwn",
                    "text": f"⚙️ *Function:* `{record.funcName}`"
                    }
                ]
                }
            ]

        }
        try:
            requests.post(self.webhook_url, json=payload)
        except Exception as e:
            print(f"Failed to send Slack message: {e}")