############
# Makefile #
################################################
# Usable Targets:                              #
# * sprite: rebuild the sprite                 #
# * scripts: rebuild auto-generated scripts    #
# * build: build the project                   #
# * dist: prepare a new distribution release   #
# * merge-master: merges a release into master #
# * doc: rebuild documentation and reference   #
# * clean: remove autogenerated build files    #
################################################

####################################################################################
# builds (packs, optimizes and compresses) the whole project for test distribution #
####################################################################################
build: images scripts remove-debug-code
	make remove-images
	make doc
	./build-scripts/build.sh
	echo "Build finished."

################################################
# prepares a new release for distribution      #
# requires an active  "release-VERSION" branch #
################################################
dist: Version NEWS
	./build-scripts/apply-version.sh
	$(eval VERSION := $(shell cat Version))
	git add -u
	git add Version
	git commit -m 'release-$(VERSION): version pushed'
	make build
	make manifest.appcache
	git add -u
	git add manifest.appcache
	git commit -m 'release-$(VERSION): project built'
	make remove-dev-files
	git add -u
	git commit -m 'release-$(VERSION): build scripts and dev files removed'
	echo "Release Build finished. See 'git log' for automatic commits"

################################################
# merge the current release branch with master #
# use directly after 'make release'            #
# THINK (and TEST) before using!               #
################################################
merge-master: FORCE
	$(eval VERSION := $(shell cat Version))
	git checkout master
	git merge -X theirs release-$(VERSION)
	git tag -a -m 'Release $(VERSION)' $(VERSION)
	echo "Finished merging branch release-$(VERSION) into branch master."

##############################################
# update all automatically generated scripts #
##############################################
scripts: FORCE
	./build-scripts/write-scripts.sh
	./build-scripts/update-headers.sh

######################
# convenience target #
######################
sprite: images/sprite.png

######################################
# update documentation and reference #
######################################
doc: scripts remove-reference
	./build-scripts/write-reference.sh

#############################
# enforce the gjslint style #
#############################
style: FORCE
	find scripts -name '*.js' | grep -v 'scripts/lib' | xargs fixjsstyle

###############################
# remove auto-generated files #
###############################
clean:
	rm -f Version manifest.appcache

include build-scripts/Makefile.in
