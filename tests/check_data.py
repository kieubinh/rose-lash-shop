import json
from pathlib import Path
services = json.loads((Path(__file__).resolve().parents[1] / 'data/services.json').read_text())
assert len(services) == 26, f'Expected 26 services, got {len(services)}'
assert {s['category'] for s in services} == {'Lashes','Brows','Waxing'}
assert len({s['id'] for s in services}) == len(services)
assert all(isinstance(s['price'],int) and s['price']>0 for s in services)
assert [(s['name'],s['infill']) for s in services if s['infill'] is not None] == [('Classic Lashes',50),('Volume Lashes',60),('Hybrid Lashes',60),('Wet Look Lashes',60),('Wispy Lashes',70),('Mega Volume Lashes',80)]
assert next(s['price'] for s in services if s['id']=='wax-body')==130
print('PASS: 26 service records, unique IDs, correct infill prices and body-wax price')
