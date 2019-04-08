
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
echo "- Building client";

cd ./client;
yarn;
cd ../;

# Build the client admin
echo "- Building client admin";

cd ./client-admin;
yarn;
cd ../;
