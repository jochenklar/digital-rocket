import os,sys,json,math

pc = 206264.806

data = [{
    'glon': 0,
    'glat': 0,
    'vmag': 4.8,
    'd': 0,
    'hip': 00
}]

f = open('data/asu_big1.tsv', 'r')
for line in f:
    if not line.startswith('#'):
        u = line.decode('ISO-8859-1').encode('utf8')
        s = u.strip().split(';')
        if len(s) > 1 and s[0] != '' and float(s[10]) != 0.0:
            glon = float(s[0])
            glat = float(s[1])
            dist = 1000 * pc / float(s[10])

            d = {
                'glon': glon,
                'glat': glat,
                'vmag': float(s[7]),
                'dist': dist,
                'id': int(s[4].strip())
            }

            data.append(d)

open('data/asu.json','w').write(json.dumps(data))

#pandas