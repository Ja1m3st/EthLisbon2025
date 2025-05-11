import json

with open('csvjson.json', 'r') as f:
    pools = json.load(f)

unique_tags = set()
for pool in pools:
    tags = pool.get('tags', '')
    if tags and tags.strip() and tags.upper() != 'NULL':
        for tag in tags.split(','):
            tag = tag.strip()
            if tag and tag.upper() != 'NULL':
                unique_tags.add(tag)

print('Unique tags:')
for tag in sorted(unique_tags):
    print('-', tag)
