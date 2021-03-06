(function() {
    angular
        .module("Oota")
        .controller("AdminController", AdminController);

    function AdminController( UserService, OrderService, RestaurantService, $rootScope) {
        var vm = this;
        vm.updateCurrentSelection=updateCurrentSelection;
        vm.users = [];
        vm.orders = [];
        vm.restaurants = [];



        function init() {
            console.log("hello admin");
            vm.user = $rootScope.user;
            vm.currentSelection="users";
            UserService
                .findAllUsers()
                .success(function (users) {
                    vm.users = users;
                });
            /*
             OrderService
             .findActiveOrdersForOrderer(vm.uid)
             .success(function (orders) {
             vm.orders = orders;
             }); */
            //window.setInterval(updateStatus, 5000);
            console.log(vm.users);



        }

        init();

/*
         function updateStatus() {
         console.log("updating..");
         OrderService
         .findActiveOrdersForOrderer(vm.uid)
         .success(function (orders) {
         vm.users = orders;
         });
         }
*/
        function updateCurrentSelection(cs) {
            vm.currentSelection = cs;

            if (cs == 'orders')
            {
                OrderService
                    .findAllOrders()
                    .success(function (orders) {
                        vm.orders = orders;
                    });
            }
            else if(cs == 'restaurants')
            {
                RestaurantService
                    .findAllRestaurants()
                    .success(function (restaurants) {
                        vm.restaurants = restaurants;
                    });
            }
        }



    }
})();