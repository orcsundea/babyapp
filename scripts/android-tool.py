import os,sys,subprocess,urllib.parse,shlex
from pathlib import Path
e=os.environ.copy()
jdk=next(Path('/workspace/toolchains').glob('jdk-21*'))
e['JAVA_HOME']=str(jdk)
e['ANDROID_HOME']='/workspace/toolchains/android-sdk'
e['ANDROID_SDK_ROOT']=e['ANDROID_HOME']
e['ANDROID_USER_HOME']='/workspace/toolchains/android-user'
e['ANDROID_SDK_HOME']='/workspace/toolchains/java-user'
e['ANDROID_EMULATOR_HOME']=e['ANDROID_USER_HOME']
e['GRADLE_USER_HOME']='/workspace/toolchains/gradle-cache'
e['ANDROID_AVD_HOME']='/workspace/toolchains/avd'
Path(e['ANDROID_AVD_HOME']).mkdir(exist_ok=True)
e['PATH']=str(jdk/'bin')+':'+e['ANDROID_HOME']+'/platform-tools:'+e['PATH']
Path('/workspace/toolchains/java-user').mkdir(exist_ok=True)
options=['-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts','-Duser.home=/workspace/toolchains/java-user','-Djava.util.prefs.userRoot=/workspace/toolchains/java-user/prefs']
proxy=urllib.parse.urlsplit(e.get('HTTPS_PROXY',e.get('https_proxy','')))
if proxy.hostname:
 for protocol in ['https','http']:
  options.extend([f'-D{protocol}.proxyHost={proxy.hostname}',f'-D{protocol}.proxyPort={proxy.port or 80}'])
 options.append('-Dhttp.nonProxyHosts=localhost|127.*')
e['JAVA_OPTS']=shlex.join(options)
e['GRADLE_OPTS']=shlex.join(options)
Path(e['ANDROID_USER_HOME']).mkdir(exist_ok=True)
args=sys.argv[1:]
if args[0] in ['sdkmanager','avdmanager']:args[0]=e['ANDROID_HOME']+'/cmdline-tools/latest/bin/'+args[0]
if args[0]=='adb':args[0]=e['ANDROID_HOME']+'/platform-tools/adb'
if args[0]=='emulator':args[0]=e['ANDROID_HOME']+'/emulator/emulator'
if '--no-custom' in args:
 args.remove('--no-custom')
 result=subprocess.run(args,env=e,input='no\n',text=True)
elif '--accept-licenses' in args:
 args.remove('--accept-licenses')
 result=subprocess.run(args,env=e,input='y\n'*100,text=True)
else:result=subprocess.run(args,env=e)
sys.exit(result.returncode)
