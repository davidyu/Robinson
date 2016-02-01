# include library files

if [ "$1" = "debug" ]
then
    find ../../src -name "*.ts" -not -path "*/dist/*" -not -path "*/2d/*" -type f > files.txt;
fi

# include sample source files

find . -name "*.ts" -type f >> files.txt;
