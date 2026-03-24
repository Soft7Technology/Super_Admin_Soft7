# ---------- PACKAGE GROUPS (Synced with package.json) ----------

PACKAGES = @prisma/client @radix-ui/react-select @tanstack/react-query axios bcryptjs cookie-parser cors dotenv express gsap ioredis jose jsonwebtoken libphonenumber-js lucide-react morgan multer next nodemailer react react-dom react-hot-toast redis twilio uuid

DEV_PACKAGES = @types/node @types/nodemailer @types/react @types/react-dom autoprefixer nodemon postcss prisma tailwindcss typescript

# ---------- INSTALL ----------
install:
	npm install $(PACKAGES) --save
	npm install $(DEV_PACKAGES) --save-dev
	@echo "✅ All packages installed (synced with package.json)"

# ---------- DEV ----------
dev:
	npm run dev

dev-backend:
	npm run dev:backend

dev-frontend:
	npm run dev:frontend

dev-all:
	npx concurrently "npm run dev:backend" "npm run dev:frontend"

# ---------- BUILD ----------
build:
	npm run build

start:
	npm run next:start

# ---------- PRISMA ----------
prisma-generate:
	npx prisma generate

prisma-migrate:
	npx prisma migrate dev

# ---------- CLEAN ----------
clean:
	npx rimraf node_modules package-lock.json
	@echo "🧹 Cleaned project"

# ---------- RESET ----------
reset: clean
	make install
	@echo "♻️ Fresh install completed"

# ---------- SETUP ----------
setup:
	@echo "⚙️ Setting up project..."
	make install
	make prisma-generate
	make dev