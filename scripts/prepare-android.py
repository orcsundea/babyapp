"""Reproduce the Android toolchain in this isolated /workspace cloud machine."""
from pathlib import Path
import hashlib,tarfile,zipfile,subprocess
root=Path('/workspace/toolchains');downloads=root/'downloads';downloads.mkdir(parents=True,exist_ok=True)
def obtain(name,url,digest,algorithm):
 path=downloads/name
 if not path.exists():subprocess.run(['curl','--fail','--location','--retry','2','--silent','--show-error',url,'-o',str(path)],check=True)
 actual=hashlib.new(algorithm,path.read_bytes()).hexdigest()
 if actual!=digest:raise SystemExit(f'{name}: checksum mismatch. Obtain a verified official artifact; do not bypass verification.')
 return path
if not list(root.glob('jdk-21*')):
 archive=obtain('jdk21.tar.gz','https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz','12f870b21301b42292558a3f872ce543affa2b86cb6458591c78388c41ddb111','sha256')
 with tarfile.open(archive) as t:t.extractall(root,filter='data')
cli=root/'android-sdk/cmdline-tools/latest'
if not cli.exists():
 archive=obtain('android-cli.zip','https://dl.google.com/android/repository/commandlinetools-linux-16111833_latest.zip','e025545c62a8e64c7559119566a569fb1dec5f60','sha1')
 cli.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(archive) as z:z.extractall(cli.parent)
 (cli.parent/'cmdline-tools').rename(cli)
 for file in (cli/'bin').iterdir():file.chmod(0o755)
runner=Path(__file__).with_name('android-tool.py')
subprocess.run(['python3',str(runner),'sdkmanager','--sdk_root='+str(root/'android-sdk'),'platforms;android-35','build-tools;35.0.0','platform-tools'],check=True)
repo=Path(__file__).resolve().parent.parent
(repo/'android/local.properties').write_text('sdk.dir=/workspace/toolchains/android-sdk\n')
print('Android toolchain ready.')
