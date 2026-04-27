# ---------- CONFIG ----------

# Main dependencies
PACKAGES = react react-dom zod jose reactflow next is-mobile lucide-react antd react-icons firebase swr tailwind-merge tailwindcss @tailwindcss/postcss postcss autoprefixer @prisma/client prisma next-themes

#  Dev dependencies
DEV_PACKAGES = @types/react @types/react-dom

# Install all dependencies
install:
	npm install $(PACKAGES) --save && npm install $(DEV_PACKAGES) --save-dev
	@echo "All packages installed!"

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
 
# ---------- CLEAN / RESET ----------
clean:
  npx rimraf node_modules package-lock.json
  @echo "🧹 Cleaned project"
 
reset: clean
  npm install
  @echo "♻️ Fresh install completed"
 
# ---------- FULL SETUP ----------
setup:
  @echo "⚙️ Setting up project..."
  make install
  make prisma-generate
  @echo "🚀 Setup done. Starting dev server..."
  make dev
 
# ---------- MASTER COMMAND ----------
all: install prisma-generate
  @echo "🚀 Setup complete. Starting app..."
  make dev
 