#!/bin/bash
#
# creates a core class

##########
# syntax #
##########

set -e -u

( (( ${#@} == 0 )) || [ -z "$1" ] || [ "$1" == "--help" ] || [ "$1" == "-help" ] || [ "$1" == "-h" ] ) && {
    cat >&2 <<EOF
Syntax: $0 ClassName

DESCRIPTION:

        Create a new class file inside core/scripts/, according to the ClassName.
        The ClassName is required to be in alpha-only upper camel case
EOF
    exit 1
}

##################
# initialization #
##################

class=$1
filename=`tr '[:upper:]' '[:lower:]' <<< $class`.js
dir=core/scripts
fullpath=$dir/$filename
super=$2
[ -z "$super" ] && super=`grep -Po '[A-Z][a-z]+$' <<< $class`
superref=./`tr '[:upper:]' '[:lower:]' <<< $super`
superpath=$dir/`basename $superref.js`
gitauthor="$(git config user.name)"
gitemail="$(git config user.email)"

[ -z "$gitauthor" ] && { echo "error: git config: user.name missing">&2; exit 1; }
[ -z "$gitemail" ] && { echo "error: git config: user.email missing">&2; exit 1; }

#########################
# output for validation #
#########################

cat <<EOF
ClassName: $class
file path: $fullpath
path name: $dir
file name: $filename
superclass: $super
superref: $superref
author: $gitauthor
email: $gitemail

EOF

####################
# validation stuff #
####################

grep -P '([A-Z][a-z]+){2,}' &>/dev/null <<< $class || { echo "'$class' is not in CamelCase with two or more words" >&2; exit 1; }

[ -s $fullpath ] && {  echo "$fullpath already exists">&2; exit 1;}
[ -f $superpath ] || { echo "superclass file does not exist: $superpath">&2; exit 1; }

####################
# writing the file #
####################

cat > $fullpath <<EOF
/**
 * $class
 * 
 * @return $class
 * @author $gitauthor <$gitemail>
 * @license MIT License
 * @see LICENSE
 */
define(['lib/extend', '$superref'], function(extend, $super){
  /**
   * Constructor
   */
  function $class() {
    $class.superconstructor.call(this);
  }
  extend($class, $super);

  return $class;
});
EOF

echo "$fullpath created:"
echo

cat "$fullpath"
