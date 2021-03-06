
(function() {
    angular
        .module("Oota")
        .controller("ReviewOrderController", ReviewOrderController);

    function ReviewOrderController($window, $location, UserService,$http,$routeParams, localStorageService,OrderService,$rootScope) {
        var vm = this;
        vm.updateOrder = updateOrder;
        vm.placeOrder = placeOrder;
        vm.getCurrentAddress = getCurrentAddress;
        vm.getActiveOrderForUser = getActiveOrderForUser;
        vm.getActiveOrders = getActiveOrders;
        vm.logout = logout;
        vm.orders = [];

        function init() {
            $http.get('/api/loggedin').success(function(user) {
                $rootScope.errorMessage = null;
                if (user !== '0') {
                    $rootScope.user = user;
                } else {

                }
            });

            if($rootScope.user != null){
                vm.user=$rootScope.user;
            }

            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();

            vm.restuarantId = $routeParams['resid'];
            vm.userId = $rootScope.user._id;
            vm.pickupLoc = localStorageService.get("pickupLoc");
            vm.restaurantName = localStorageService.get("restaurantName");
            localStorageService.remove("restaurantName");
            localStorageService.remove("pickupLoc");
            var dishes = localStorageService.keys();

            dishes.forEach(function (dish) {
                vm.orders.push({"dish":dish, "price": localStorageService.get(dish).price, "count": localStorageService.get(dish).count});
            });
            localStorageService.set("restaurantName", vm.restaurantName);
            localStorageService.set("pickupLoc", vm.pickupLoc);
            console.log("orders" + vm.orders);
        }

        init();

        function updateOrder(count, dish, price)
        {
            if (count <= 0)
            {
                localStorageService.remove(dish);
                return 0;
            }
            if (localStorageService.get(dish) == null)
            {
                localStorageService.set(dish, {"price": price, "count": count});
            }
            else
            {
                localStorageService.set(dish, {"price": price, "count": count});
            }
            return count;
        }

        function getCurrentAddress(){
            $window.navigator.geolocation.getCurrentPosition(function(position) {

                OrderService
                    .getCurrentAddress(position.coords.latitude,position.coords.longitude)
                    .then(function (res) {
                        console.log(res);
                        vm.deliveryLoc=res.data.results[0].formatted_address;
                    });
                console.log(position)})
        }

        function placeOrder() {
            var orderItems = [];
            var orderPrices = [];
            var orderQtys = [];

            if(localStorageService.keys().length <= 2)
            {
                alert("Please select a food item before proceding to checkout!");
                return;
            }

            if ((vm.deliveryLoc == "") || (typeof vm.deliveryLoc == "undefined")){
                alert("Please enter a delivery location before place your order!");
                return;
            }


            localStorageService.remove("restaurantName");
            localStorageService.remove("pickupLoc");
            var dishes = localStorageService.keys();
            vm.orders = [];
            dishes.forEach(function (dish) {
                vm.orders.push({"dish":dish.replace(/ *\([^)]*\) */g, ""), "price": localStorageService.get(dish).price, "count": localStorageService.get(dish).count});
            });

            console.log(vm.orders);

            vm.orders.forEach(function(orderItem){
                orderItems.push(orderItem.dish);
                orderPrices.push(orderItem.price);
                orderQtys.push(orderItem.count);
            });

            var order = {
                apiKey:vm.restuarantId,
                _orderer: vm.userId,
                restaurantName: vm.restaurantName,
                deliveryLoc: vm.deliveryLoc,
                pickupLoc: vm.pickupLoc,
                items:orderItems,
                prices:orderPrices,
                qty:orderQtys
            };

            localStorageService.clearAll();

            console.log("place order : " + order);
            OrderService
                .createOrder(order)
                .then(function () {
                    $location.url("/userProfile/"+$rootScope.user.username);
                })
        }

        function getActiveOrderForUser() {
            vm.activeOrdersForUser= [];
            OrderService
                .findActiveOrdersForOrderer(vm.userId)
                .then(function (orders) {
                    console.log(orders);
                    vm.activeOrdersForUser = orders;
                });
        }
        function getActiveOrders() {
            vm.activeOrders= [];
            OrderService
                .findActiveOrders()
                .then(function (orders) {
                    console.log(orders);
                    vm.activeOrders = orders;
                });
        }
        function logout() {
            UserService
                .logout()
                .success(function () {
                    console.log("User logged out");
                    $rootScope.user = null;
                    vm.user = null;
                    $location.url("/homepage");
                });
        }


    }
})();