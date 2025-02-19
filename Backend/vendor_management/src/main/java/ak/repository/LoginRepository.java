package ak.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ak.entity.Vendor;

@Repository

public interface LoginRepository extends JpaRepository<Vendor, Integer>
{
}
