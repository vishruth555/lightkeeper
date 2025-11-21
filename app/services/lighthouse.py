import subprocess
import json
import os
import uuid
from app.core.logging import logger
from app.models.page import Page, DeviceType
from app.models.page_score import PageScore, parse_page_score


#add global config for lighthouse

def run_lighthouse(page: Page):
    logger.info(f"lighthouse running for {page.url} with {page.device}")
    output_path = f"/tmp/lighthouse-{uuid.uuid4()}.json"
    command = [
        'lighthouse',
        page.url,
        '--output=json',
        f'--output-path={output_path}',
        '--quiet',
    ]

    command.append('--chrome-flags= "--no-sandbox --disable-dev-shm-usage --headless --disable-gpu"')

    if page.device == DeviceType.mobile:
        command.append(f"--form-factor=mobile")
    if page.device == DeviceType.desktop:
        command.append(f"--preset=desktop")
    
    #TODO configure the throttlting section to have more control
    # if config.isThrottled:
    #     command.append("--throttling-method=devtools")

    # if config.extraHeaders:
    #     command.append(f"--extra-headers={json.dumps(config.extraHeaders)}")

    try:
        subprocess.run(command, check=True)
        with open(output_path, 'r') as f:
            result = json.load(f)
        page_score = parse_page_score(result, page).model_dump(by_alias=True)
        return page_score
    except Exception as e:
        logger.error(f"lighthouse command did not work, find details here -> {e}")
    finally:
        os.remove(output_path)





