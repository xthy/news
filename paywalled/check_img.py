import re
html = open('invest_debug_source.html', encoding='utf-8').read()

# Check if dl/img_pop_div is still in the source
idx = html.find('img_pop_div')
if idx >= 0:
    print("img_pop_div FOUND - dl unwrap did NOT run before page_source capture")
    print(html[max(0,idx-100):idx+300])
else:
    print("img_pop_div NOT found in source")

# Check for any img tags within #article
article_idx = html.find('id="article"')
if article_idx >= 0:
    article_html = html[article_idx:article_idx+5000]
    imgs = re.findall(r'<img[^>]+>', article_html)
    print(f"\nImages in article area: {len(imgs)}")
    for img in imgs:
        print(f"  {img}")
else:
    print("Article div not found")

# Check Readability output for images
rd = open('invest_debug_readability.html', encoding='utf-8').read()
imgs_rd = re.findall(r'<img[^>]+>', rd)
print(f"\nImages in Readability output: {len(imgs_rd)}")
for img in imgs_rd:
    print(f"  {img}")
