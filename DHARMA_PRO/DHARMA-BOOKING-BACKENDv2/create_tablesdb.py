# create_tablesdb.py
from database.database import engine, Base
# Import all models so Base.metadata populates
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
import database.models.common.ticket_model


def create_all_tables():
    # Manually drop the old parking_zones table with CASCADE to avoid conflicts
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            # only drop if you specifically need to - otherwise comment out
            conn.execute(text("DROP TABLE IF EXISTS parking_zones CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS parking_slots CASCADE"))
            conn.commit()
        except Exception as e:
            print(f"Note (drop attempt): {e}")
            
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")


if __name__ == "__main__":
    create_all_tables()
