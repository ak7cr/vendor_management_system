package ak.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import ak.Service.VendorService;
import ak.entity.Vendor;

@Controller
public class LoginController {
    
    @Autowired
    private VendorService vendorService;

    public LoginController(VendorService vendorService) {
        this.vendorService = vendorService;
    }
    
    @PostMapping("/stager")
    public ModelAndView validateLogin(
            @RequestParam("email") String email,
            @RequestParam("password") String password) throws Exception {
        
        ModelAndView mav = new ModelAndView();

        // Fetch vendor data based on email
        List<Vendor> vendorList = vendorService.findByEmailContaining(email);
    
        if (vendorList.isEmpty()) {
            mav.addObject("errorMessage", "Invalid email or password!");
            mav.setViewName("login");
            return mav;
        }
    
        Vendor vendorData = vendorList.get(0);
        String dbPwd = vendorData.getPassword();
    
        if (password.equals(dbPwd)) {
            System.out.println("Successfully logged in");
            mav.addObject("vendorName", vendorData.getName());
            mav.setViewName("home");
        } else {
            mav.addObject("errorMessage", "Invalid email or password!");
            mav.setViewName("login");
        }
    
        return mav; 
    }
}
