from logging.config import fileConfig
import os
from dotenv import load_dotenv

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ---------------------------------------------
# Load environment variables (STEP 4 FIX)
# ---------------------------------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# ---------------------------------------------
# Import Base + ALL MODELS so Alembic sees them
# ---------------------------------------------
from database.database import Base

import database.models.user.user_model
import database.models.booking.booking_model
import database.models.booking.booking_participant_model
import database.models.booking.slot_model
import database.models.temple.temple_model
import database.models.admin.admin_model
import database.models.payment.payment_model
import database.models.common.sms_model
import database.models.parking.parking_model
import database.models.parking.parking_slot_model
import database.models.common.ticket_model   # <-- IMPORTANT
# ---------------------------------------------


# Alembic Config
config = context.config

# Load logging config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------
# SET DATABASE URL FOR ALEMBIC (STEP 4 FIX)
# ---------------------------------------------
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)
else:
    print("❌ WARNING: DATABASE_URL not found in .env")


# ---------------------------------------------
# Alembic target metadata
# ---------------------------------------------
target_metadata = Base.metadata



# =========================================================
# OFFLINE MIGRATIONS
# =========================================================
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()



# =========================================================
# ONLINE MIGRATIONS
# =========================================================
def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,      # detect column type changes
            compare_server_default=True
        )

        with context.begin_transaction():
            context.run_migrations()



# =========================================================
# Choose online/offline
# =========================================================
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
