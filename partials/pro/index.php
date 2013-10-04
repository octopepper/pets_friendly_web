<?php 
    session_start();
    if(!isset($_SESSION['isLoggedIn']))
    {
       // header('HTTP/1.0 401 Unauthorized');
        //exit();
    }
?>
<header class="espace-pro">
    <div class="ymp-header"></div>
    <div class="sub-header">
        <ul class="left">
            <li>Terminer mon inscription</li>
        </ul>
        <ul class="right">
            <li ng-click="load('accueil')">Accueil</li> 
            <li>/</li>
            <li ng-click="load('stats')">Mes Statistiques</li>
            <li>/</li>
            <li ng-click="load('offre')">Mon Offre</li>
            <li>/</li>
            <li><a href="./#/search">Pets Friendly</a></li>
        </ul>
    </div>
</header>
<div id="Content" ng-include="module.url"></div>