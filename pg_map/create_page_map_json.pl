#!/usr/bin/perl

#use lib "/websites/kobool.com/cgi-bin/";

#use utils;
use DBI;
use JSON;

sub db_connect
{
	my ( $dbase, $host, $dbuser, $dbpass ) = @_;

	$dbase = $dbase ? $dbase : "kobool";
	$host  = $host  ? $host : "localhost";

	$dbuser   = $dbuser || "root";
	if(!defined $dbpass) {
		$dbpass   = "kobool_2004";
	}

	my $dsn = "DBI:mysql:database=$dbase;host=$host";

	my $dbh = DBI->connect($dsn, $dbuser, $dbpass);
	
	$dbh->do("set names utf8"); #Should be used after repairing text tables to UTF8 format
	
	return $dbh;
}

#my $json = JSON->new->allow_nonref->pretty;
my $json = JSON->new->allow_nonref;

if( my $dbh = db_connect("quran","home.kobool.com") )
{
	
	for( my $pg = 1; $pg < 605; $pg ++ ){
		
		my $info = {page=>$pg, success=>0,child_list=>[]};
		my $sth = $dbh->prepare("select * from page_layout where page=? order by sura, aya");
		$sth->execute($pg);
		
		while( my $row = $sth->fetchrow_hashref ){
			$info->{success} ++;
			push @{$info->{child_list}}, $row;
		}
		$sth->finish;

		open( FILE_HANDLE, ">pm_$pg.json" );
		print FILE_HANDLE $json->encode($info);
		close FILE_HANDLE;
	}
	$dbh->disconnect;
}

