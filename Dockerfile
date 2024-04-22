# Use the official Bun image
FROM oven/bun:1.1.4-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb (if exists) to utilize Docker cache
COPY package.json bun.lockb* ./

# Install dependencies using the production flag to skip devDependencies
RUN bun install --frozen-lockfile --production

# Copy the entire project directory into the container
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Specify the command to run your app
ENTRYPOINT ["bun", "run", "src/apis/index.js"]
