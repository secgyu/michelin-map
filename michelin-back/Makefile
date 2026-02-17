.PHONY: crawl server build clean

crawl:
	go run cmd/crawler/main.go

server:
	go run cmd/server/main.go

build:
	go build -o bin/server cmd/server/main.go

build-windows:
	go build -o bin/server.exe cmd/server/main.go

clean:
	rm -rf bin/
