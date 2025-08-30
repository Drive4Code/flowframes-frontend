# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.38 AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/src/ .
COPY --from=prerelease /app/package.json .

# # Debugging step: List contents after build
# RUN ls -a ./dist/

# Use an Nginx image to serve the static files
FROM nginx:alpine

COPY nginx.conf /etc/nginx/

# Copy the built files from the previous stage
COPY --from=prerelease /app/dist /usr/share/nginx/html

EXPOSE 8060

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]