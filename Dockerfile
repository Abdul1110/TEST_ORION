FROM mhart/alpine-node:12 as installer
ARG target
ARG SOURCE_VERSION
ARG BRANCH_NAME
ARG REDIS
ARG COOKIE_SECRET
ARG AUTH_CLIENT_SECRET

WORKDIR /app
COPY . .

# install python
RUN apk update && apk add --no-cache openssh g++ gcc libgcc libstdc++ linux-headers make python
#RUN npm install --quiet node-gyp -g

# Bundle APP files
RUN HUSKY_SKIP_INSTALL=true npm install
RUN SOURCE_VERSION=$SOURCE_VERSION BRANCH_NAME=$BRANCH_NAME REDIS=$REDIS COOKIE_SECRET=$COOKIE_SECRET AUTH_CLIENT_SECRET=$AUTH_CLIENT_SECRET npm run $target
# End of installation

# Begin release
FROM mhart/alpine-node:12 as release

ARG target
ARG REDIS
ARG COOKIE_SECRET
ARG AUTH_CLIENT_SECRET

# install bash
RUN apk update && apk add --no-cache bash \
      && rm -rf /var/cache/apk/*

# App
WORKDIR /app
COPY --from=0 /app/dist dist
RUN printf 'REDIS=%s\nAUTH_CLIENT_SECRET=%s\nCOOKIE_SECRET=%s\n' "$REDIS" "$AUTH_CLIENT_SECRET" "$COOKIE_SECRET" > /app/.env
RUN chmod +r /app/.env

# Build a shell script
RUN printf '#!/bin/sh \nAPP_TARGET=%s NEST_ENV=production node dist/server\n' "$target" > ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 80 443
ENTRYPOINT ["./entrypoint.sh"]
