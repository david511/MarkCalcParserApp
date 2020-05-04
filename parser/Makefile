CC = gcc
CPPFLAGS=
CFLAGS = -Wall -g -std=c11 -Iinclude -fpic
LDFLAGS= -L. -lm

all:
	$(CC) $(CFLAGS) -c ./src/LinkedListAPI.c -o ./bin/LinkedListAPI.o
	# $(CC) $(CFLAGS) ./src/outline_parser.c ./bin/LinkedListAPI.o -o outline_parser
	$(CC) $(CFLAGS) -c ./src/outline_parser.c -o ./bin/outline_parser.o
	$(CC) $(CFLAGS) -shared ./bin/outline_parser.o ./bin/LinkedListAPI.o -o ../libgpxparse.dylib

clean:
	rm -f ./bin/*.o
	rm -f *.o
	rm -f ./bin/*.so
