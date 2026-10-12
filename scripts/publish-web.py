"""Publish only the tested static browser build; preserve the source checkout and index."""
from pathlib import Path
import json,os,subprocess,tempfile,hashlib
repo=Path(__file__).resolve().parent.parent
build=repo/'dist'
def git(*args,env=None):
 return subprocess.check_output(['git','-C',str(repo),*args],env=env,text=True).strip()
if not (build/'index.html').exists():raise SystemExit('Run npm run build:web first.')
for p in build.rglob('*'):
 if p.is_file() and p.suffix.lower() in ['.apk','.jks','.keystore','.dex']:raise SystemExit('Native/signing file found in web build; stopped.')
for p in (build/'assets').glob('*.js'):
 if 'Capacitor' in p.read_text():raise SystemExit('Native SDK found in browser build; stopped.')
if 'Content-Security-Policy' not in (build/'index.html').read_text():raise SystemExit('Browser content policy missing; stopped.')
remote=git('ls-remote','origin','refs/heads/gh-pages')
parent=None
if remote:
 subprocess.run(['git','-C',str(repo),'fetch','origin','gh-pages'],check=True)
 parent=git('rev-parse','FETCH_HEAD')
 try:old=json.loads(git('show',f'{parent}:bodre-web-build.json'))
 except Exception:raise SystemExit('An existing unrelated gh-pages branch was found; preserve it and inspect before replacing.')
 if old.get('runtime')!='browser-only' or old.get('app')!='bodre':raise SystemExit('Existing deployment is not this browser app; stopped.')
(build/'bodre-web-build.json').write_text(json.dumps({'app':'bodre','runtime':'browser-only','source_commit':git('rev-parse','HEAD')},indent=2)+'\n')
with tempfile.TemporaryDirectory(prefix='bodre-web-index-',dir='/tmp') as temp:
 env=os.environ.copy();env['GIT_INDEX_FILE']=str(Path(temp)/'index')
 env['GIT_AUTHOR_NAME']=env['GIT_COMMITTER_NAME']='Codex'
 env['GIT_AUTHOR_EMAIL']=env['GIT_COMMITTER_EMAIL']='codex@openai.com'
 git('read-tree','--empty',env=env)
 count=0
 for p in sorted(build.rglob('*')):
  if not p.is_file():continue
  name=p.relative_to(build).as_posix()
  oid=git('hash-object','-w',str(p))
  git('update-index','--add','--cacheinfo',f'100644,{oid},{name}',env=env)
  count+=1
 tree=git('write-tree',env=env)
 args=['commit-tree',tree]
 if parent:args+=['-p',parent]
 commit=subprocess.check_output(['git','-C',str(repo),*args],input='Deploy browser-only Bodre PWA\n',env=env,text=True).strip()
 subprocess.run(['git','-C',str(repo),'push','origin',f'{commit}:refs/heads/gh-pages'],check=True)
 print(f'Published {count} static files to gh-pages. Commit: {commit}')
 print('Hosting activation is separate; this command does not enable GitHub Pages settings.')
