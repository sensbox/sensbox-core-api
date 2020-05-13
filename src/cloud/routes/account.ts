import { AccountController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  setAccountToAdmin: {
    action: AccountController.setAccountToAdmin,
    secure: true,
  },
  setAccountToBasic: {
    action: AccountController.setAccountToBasic,
    secure: true,
  },
};

export default definitions;
