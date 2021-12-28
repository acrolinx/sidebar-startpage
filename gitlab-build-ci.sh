set -ex

SELECTOR_VERSION=`cat package.json | grep "version\":" | cut -d'"' -f4`

# SIDEBAR_VERSION_SHORT=$(printf "%s\n" "${SIDEBAR_VERSION?}" | cut -d . -f 1-2)
CLASSIFIER=-SNAPSHOT

# prod is triggered on release tag!
if [ "$CI_JOB_STAGE" = "publish_public" ]; then
    echo "Creating release version ID..."
  	CLASSIFIER=.$CI_PIPELINE_IID
fi

mvn versions:set -DnewVersion=$SELECTOR_VERSION$CLASSIFIER -DgenerateBackupPoms=false

mvn deploy -DpomFile=pom.xml -s ci_settings.xml
