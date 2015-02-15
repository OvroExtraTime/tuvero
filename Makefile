##################################################################
# Build all or individual projects.															 #
# For more options, run `make ...` in the individual directories #
##################################################################

# primary build targets

all: scripts
#	make test
	make boule
	make tac


tac: tac/index.html

boule: boule/index.html

test: test/index.html

clean: FORCE
	rm -rf *-build/ Version

# primary global targets

scripts: FORCE
	./build-tools/create-commonjs.sh
	./build-tools/create-testjs.sh
	./build-tools/update-headers.sh

codestyle: FORCE
	./build-tools/codestyle.sh

# secondary global targets

Version: FORCE
	./build-tools/write-Version.sh

NEWS: FORCE
	sed -i "1s/yyyy-mm-dd/`date +%F`/" NEWS

clean-build-tools:
	rm -rf Makefile build-tools/ build-scripts/

clean-shared-code:
	rm -rf lib core legacy

release: Version NEWS
	./build-tools/prepare-release.sh

merge-master: FORCE
	./build-tools/merge-master.sh

# makefile-related secondary targets

%: %/index.html FORCE
	cd $@ && make -f ../build-tools/Makefile build

FORCE:
