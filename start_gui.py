import subprocess
import tkinter as tk
from tkinter import messagebox
import os
import signal

# ---------------------------
# Project Paths (Update if needed)
# ---------------------------
REPO = r"D:\neighborhood-library-service"
BACKEND_CMD = r"backend\venv\Scripts\python.exe backend\server\app.py"
GATEWAY_CMD = r"npx nodemon index.js"
FRONTEND_CMD = r"npm start"

# Track Process Handles
backend_process = None
gateway_process = None
frontend_process = None


# -----------------------------------------------------
# START BACKEND
# -----------------------------------------------------
def start_backend():
    global backend_process
    if backend_process is None:
        try:
            backend_process = subprocess.Popen(
                BACKEND_CMD,
                cwd=os.path.join(REPO, "backend"),
                shell=True
            )
            status_backend.set("Running")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start backend: {e}")
    else:
        messagebox.showinfo("Info", "Backend already running!")


# -----------------------------------------------------
# START GATEWAY
# -----------------------------------------------------
def start_gateway():
    global gateway_process
    if gateway_process is None:
        try:
            gateway_process = subprocess.Popen(
                GATEWAY_CMD,
                cwd=os.path.join(REPO, "gateway"),
                shell=True
            )
            status_gateway.set("Running")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start gateway: {e}")
    else:
        messagebox.showinfo("Info", "Gateway already running!")


# -----------------------------------------------------
# START FRONTEND
# -----------------------------------------------------
def start_frontend():
    global frontend_process
    if frontend_process is None:
        try:
            frontend_process = subprocess.Popen(
                FRONTEND_CMD,
                cwd=os.path.join(REPO, "frontend"),
                shell=True
            )
            status_frontend.set("Running")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start frontend: {e}")
    else:
        messagebox.showinfo("Info", "Frontend already running!")


# -----------------------------------------------------
# START ALL SERVICES
# -----------------------------------------------------
def start_all():
    start_backend()
    start_gateway()
    start_frontend()


# -----------------------------------------------------
# STOP ALL SERVICES
# -----------------------------------------------------
def stop_all():
    global backend_process, gateway_process, frontend_process

    for proc, setter in [
        (backend_process, status_backend),
        (gateway_process, status_gateway),
        (frontend_process, status_frontend)
    ]:
        try:
            if proc:
                os.kill(proc.pid, signal.SIGTERM)
                setter.set("Stopped")
        except Exception:
            pass

    backend_process = gateway_process = frontend_process = None
    messagebox.showinfo("Stopped", "All services stopped.")


# -----------------------------------------------------
# GUI WINDOW
# -----------------------------------------------------
root = tk.Tk()
root.title("📚 Neighborhood Library — Launcher")
root.geometry("420x400")
root.resizable(False, False)

tk.Label(root, text="Library Management System Launcher",
         font=("Arial", 16, "bold")).pack(pady=10)


# STATUS LABELS
status_backend = tk.StringVar(value="Stopped")
status_gateway = tk.StringVar(value="Stopped")
status_frontend = tk.StringVar(value="Stopped")


# BUTTONS
frame = tk.Frame(root)
frame.pack(pady=10)

tk.Button(frame, text="Start Backend", width=20, command=start_backend).grid(row=0, column=0, padx=5, pady=5)
tk.Label(frame, textvariable=status_backend).grid(row=0, column=1)

tk.Button(frame, text="Start Gateway", width=20, command=start_gateway).grid(row=1, column=0, padx=5, pady=5)
tk.Label(frame, textvariable=status_gateway).grid(row=1, column=1)

tk.Button(frame, text="Start Frontend", width=20, command=start_frontend).grid(row=2, column=0, padx=5, pady=5)
tk.Label(frame, textvariable=status_frontend).grid(row=2, column=1)

tk.Button(root, text="Start All Services", width=30, bg="green", fg="white", command=start_all).pack(pady=10)
tk.Button(root, text="Stop All Services", width=30, bg="red", fg="white", command=stop_all).pack(pady=5)

tk.Label(root, text="Close this window to exit launcher.", fg="gray").pack(pady=20)

root.mainloop()
