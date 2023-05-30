#!/bin/bash

#docker run -it --rm -v $(pwd):/usr/src/task/ -v /root:/root -w /usr/src/task node-lts tsc

docker run --rm -ti -v ~/.aws:/root/.aws -w /usr/src/task -v $(pwd):/usr/src/task/ -v /root/dev/JBMDLFesPOSystem/.aws-lambda-rie:/usr/src/rie --env-file ./.env -p 9080:8080  --entrypoint /usr/src/rie/aws-lambda-rie node-lts /usr/local/bin/yarn aws-lambda-ric-esm index_dev.handler

# docker run --rm -ti -v ~/.aws:/root/.aws -w /usr/src/task -v /root/dev/JBMDLFesPOSystem/.aws-lambda-rie:/usr/src/rie -v $(pwd):/usr/src/task/ --env-file ./.env -p 9080:8080  --entrypoint /bin/bash node-lts 

# curl -XPOST "http://localhost:9080/2015-03-31/functions/function/invocations" -d {test:"test"}
