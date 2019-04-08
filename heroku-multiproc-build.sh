
echo "*** Building repo dynamically using heroku multiprocfiles";

# Build the server
if [ "$PROCFILE" = "" ] || [ "$PROCFILE" = "server/Procfile" ]; then
	echo "- Building server";

	cd ./server;
	yarn;
	cd ../;
else
	echo "- Not building server, not relevant to build"
fi

# Build the client
if [ "$PROCFILE" = "" ] || [ "$PROCFILE" = "client/Procfile" ]; then
	echo "- Building client";

	cd ./client;
	yarn;
	cd ../;
else
	echo "- Not building server, not relevant to build"
fi

# Build the client admin
if [ "$PROCFILE" = "" ] || [ "$PROCFILE" = "client-admin/Procfile" ]; then
	echo "- Building client admin";

	cd ./client-admin;
	yarn;
	cd ../;
else
	echo "- Not building server, not relevant to build"
fi
