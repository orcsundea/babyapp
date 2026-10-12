"""Create a private local signing key once, then sign and verify the release APK."""
from pathlib import Path
import os,secrets,subprocess,hashlib
root=Path(__file__).resolve().parent.parent
signing=Path('/workspace/signing/bodre')
signing.mkdir(parents=True,exist_ok=True)
signing.chmod(0o700)
key=signing/'release.jks'
password=signing/'password.txt'
jdk=next(Path('/workspace/toolchains').glob('jdk-21*'))
env=os.environ.copy();env['JAVA_HOME']=str(jdk);env['PATH']=str(jdk/'bin')+':'+env['PATH']
if not key.exists():
 if password.exists():raise SystemExit('Existing signing metadata found; restore its key before continuing.')
 password.write_text(secrets.token_urlsafe(32));password.chmod(0o600)
 subprocess.run([str(jdk/'bin/keytool'),'-genkeypair','-keystore',str(key),'-alias','bodre-release','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Bodre, OU=Personal App, O=Bodre','-storepass:file',str(password),'-keypass:file',str(password)],check=True,env=env)
 key.chmod(0o600)
if not password.exists():raise SystemExit('Signing password file is missing; restore it to preserve the app identity.')
unsigned=root/'android/app/build/outputs/apk/release/app-release-unsigned.apk'
if not unsigned.exists():raise SystemExit('Build the release APK first.')
tools=Path('/workspace/toolchains/android-sdk/build-tools/35.0.0')
aligned=root/'android/app/build/outputs/apk/release/app-release-aligned.apk'
subprocess.run([str(tools/'zipalign'),'-f','-p','4',str(unsigned),str(aligned)],check=True,env=env)
output=Path('/workspace/bodre-1.0.0.apk')
subprocess.run([str(tools/'apksigner'),'sign','--ks',str(key),'--ks-key-alias','bodre-release','--ks-pass',f'file:{password}','--out',str(output),str(aligned)],check=True,env=env)
subprocess.run([str(tools/'apksigner'),'verify','--verbose',str(output)],check=True,env=env)
digest=hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.apk.sha256').write_text(f'{digest}  {output.name}\n')
print(f'Signed and verified: {output.name} ({output.stat().st_size/1024/1024:.1f} MB)')
